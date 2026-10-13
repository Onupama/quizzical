import React from "react"
import { decode } from 'html-entities'
import { clsx } from "clsx"
import Confetti from "react-confetti"

export default function App() {
    // State values
    const [start, setStart] = React.useState(false)
    const [questions, setQuestions] = React.useState([])
    const [answers, setAnswers] = React.useState({})
    const [quizCompleted, setQuizCompleted] = React.useState(false)
    const [resetCount, setResetCount] = React.useState(0)
    
    let correctAnswers = 0

    function startQuiz() {
        setStart(prevStart => !prevStart)
    }

    useEffect(() => {
        fetch("https://opentdb.com/api.php?amount=5&category=17&difficulty=easy&type=multiple")
            .then(res => res.json())
            .then(data => setQuestions(data.results))
    }, [resetCount]) 

    function resetQuiz() {
        setQuestions([])
        setResetCount((prev) => prev + 1)
        setStart(false)
        setQuizCompleted(false)
        setAnswers({})
    }

    function selectOption(questionIdx, option) {
        setAnswers((prev) => ({
            ...prev,
            [questionIdx]: option
        }))
    }
    
    function checkAnswers() {
        setQuizCompleted(prev => !prev)
    }

    function findScores() {
        questions.forEach((ques, index) => {
        const selected = answers[index]
            if (selected === ques.correct_answer) {
                correctAnswers = correctAnswers + 1
            } 
        })
        return `${correctAnswers}/${questions.length}`
    }

    const scores = findScores()

    const quesElements = questions.map((quesObj, quesIdx) => {
        const randomInd = Math.floor(Math.random() * questions.length)
        if(!quesObj.incorrect_answers.includes(quesObj.correct_answer)) {
            quesObj.incorrect_answers.splice(randomInd, 0, quesObj.correct_answer)
        }

        return (
            <section 
                key={quesIdx}
                className="question"    
            >
                <h3>{decode(quesObj.question)}</h3>
                <section className="options">
                    {quesObj.incorrect_answers.map((incorrect_answer, answerIdx) => {
                        const isCorrectOption = quizCompleted && (incorrect_answer === quesObj.correct_answer)
                        const isWrong = !(answers[quesIdx] === quesObj.correct_answer)
                        const isSelected = answers[quesIdx] === incorrect_answer
                        const isNotSelected = quizCompleted && !(answers[quesIdx] === incorrect_answer)
                        const isSelectedWrong = quizCompleted && isSelected && isWrong

                        const optionClassName = clsx("option", {
                            correctoption: isCorrectOption,
                            selected: isSelected,
                            wrong: isSelectedWrong,
                            unselected: isNotSelected
                        })

                        return (
                            <button 
                                key={answerIdx}
                                className={optionClassName}
                                onClick={() => selectOption(quesIdx, incorrect_answer)}
                                disabled={quizCompleted}
                            >
                                {decode(incorrect_answer)}
                            </button>   
                        )})
                    }
                </section>
            </section>
        )
    })

    if (!start) {
        return (
            <main className="start-main">
                <h1 className="main-heading">Quizzical</h1>
                <p className="desc">Science and Nature Quiz</p>
                <button 
                    className="btn" 
                    onClick={startQuiz}
                >
                    Start quiz
                </button>
            </main>
        )
    } else {
        return (
            <main className="quiz-main">
                {correctAnswers===questions.length && quizCompleted && 
                            <Confetti 
                                recycle={false}
                                numberOfPieces={1000}
                            />
                }
                {quesElements}
                {!quizCompleted ? 
                    <button 
                        className="btn checkBtn" 
                        onClick={checkAnswers}
                    >
                        Check answers
                    </button>
                    :
                    <div className="play-again">
                        {correctAnswers===questions.length ? 
                        <span className="score">Congratulations! You scored {scores} correct answers</span> :
                        <span className="score"> You scored {scores} correct answers</span>
                        }
                        <button 
                            className="btn playagainBtn" 
                            onClick={resetQuiz}
                        >
                            Play again
                        </button>
                    </div>
                }
            </main>
        )
    }
}






