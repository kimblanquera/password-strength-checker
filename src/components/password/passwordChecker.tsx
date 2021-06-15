import React, { useState, useEffect } from 'react'
import useDebounce from '../../hooks/useDebounce';
import './passwordChecker.css';

enum PasswordStrength {
    VERY_WEAK = 0,
    WEAK = 1,
    MEDIUM = 2,
    STRONG = 3,
    VERY_STRONG = 4
}

enum StrengthColors {
    VERY_WEAK="#b71c1c",
    WEAK="#f44336",
    MEDIUM="#ff9800",
    STRONG="#7cb342",
    VERY_STRONG="#33691e"
}

interface CheckerResult {
    score: number,
    guessTimeSeconds: number,
    guessTimeString: number,
    warning: string,
    suggestions: string[]
}

interface Strength {
    text: string,
    color: StrengthColors
}

function getStrengthTextByScore(score: number) {
    return PasswordStrength[score] as keyof typeof PasswordStrength;
}

function getStrengthColor(score: number) {
    const strengthText: string = getStrengthTextByScore(score);
    return StrengthColors[strengthText as keyof typeof StrengthColors]
}

export default function PasswordChecker() {

    const [password, setPassword] = useState("");
    const [isMasked, setIsMasked] = useState(true);
    const [result, setResult] = useState<CheckerResult | null | undefined>();
    const [strength, setStrength] = useState<Strength | null | undefined>()
    const debouncedQuery = useDebounce(password, 500);

    useEffect(() => {
        
        const checkPasswordStrength = async() => {
            if(debouncedQuery) {
                const checkResult: CheckerResult = await checkStrength(debouncedQuery);
                setResult(checkResult);
                setStrength({
                    text: parseScoreText(getStrengthTextByScore(checkResult.score)),
                    color: getStrengthColor(checkResult.score)
                });
            }
            else {
                setResult(null);
                setStrength(null);
            }
        }

        checkPasswordStrength();
        
    }, [debouncedQuery])

    return (
        <div className="Container">
            <h1>Is your password strong enough?</h1>
            <div className="InputPasswordContainer">
                <input placeholder="Type a password" type={isMasked ? "password" : "text"} onChange={(e) => setPassword(e.target.value)}></input>
                <button onClick={() => setIsMasked(!isMasked)}>{ isMasked ? "Show" : "Hide" }</button>
            </div>
            {
                result && (
                    <div>
                        <div className="PasswordMeter">
                            {
                                Array.from(Array(Object.values(PasswordStrength).length / 2), (e, i) => {
                                    if(i <= result.score) {
                                        return (<div className="Meter" key={i} style={{backgroundColor: strength?.color}}></div>)
                                    }
                                    else {
                                        return (<div className="Meter" key={i} style={{backgroundColor: "#e0e0e0"}}></div>)
                                    }
                                })
                            }
                        </div>
                        <h4>Your password is <span style={{color: strength?.color}}>{ strength?.text.toLowerCase() }.</span></h4>
                        <h5>It will take { result.guessTimeString } to guess your password. { result.warning }</h5>
                        <p><strong>{ result.suggestions?.map((suggestion: string) => suggestion ) }</strong></p>
                    </div>
                )
            }
            
        </div>
    )
}

function parseScoreText(scoreText: string) {
    return scoreText.replace('_', ' ');
}

async function checkStrength(password: string) {
    const url = 'https://o9etf82346.execute-api.us-east-1.amazonaws.com/staging/password/strength';
    const data = {
        password: password
    }
    const result = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    const parsedResult: CheckerResult = await result.json();
    return parsedResult;
}

