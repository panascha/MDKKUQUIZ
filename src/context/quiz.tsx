'use client'
import React, { createContext, useReducer, useContext, ReactNode } from 'react'

export type QuizType = 'chillquiz' | 'realtest' | 'custom'
export type AnswerMode = 'end-of-quiz' | 'each-question'
export type QuestionType = 'mcq' | 'shortanswer'

interface State {
  quizType: QuizType
  answerMode: AnswerMode
  questionType: QuestionType
  categories: string[]
  questionCount: number
}

type Action =
  | { type: 'SET_QUIZ_TYPE'; payload: QuizType }
  | { type: 'SET_ANSWER_MODE'; payload: AnswerMode }
  | { type: 'SET_QUESTION_TYPE'; payload: QuestionType }
  | { type: 'SET_CATEGORIES'; payload: string[] }
  | { type: 'SET_COUNT'; payload: number }

const initialState: State = {
  quizType: 'chillquiz',
  answerMode: 'each-question',
  questionType: 'shortanswer',
  categories: [],
  questionCount: 10,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_QUIZ_TYPE':
      return { ...state, quizType: action.payload }
    case 'SET_ANSWER_MODE':
      return { ...state, answerMode: action.payload }
    case 'SET_QUESTION_TYPE':
      return { ...state, questionType: action.payload }
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload }
    case 'SET_COUNT':
      return { ...state, questionCount: action.payload }
    default:
      return state
  }
}

const QuizContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
} | null>(null)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <QuizContext.Provider value={{ state, dispatch }}>{children}</QuizContext.Provider>
}

export function useQuiz() {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider')
  return ctx
}
