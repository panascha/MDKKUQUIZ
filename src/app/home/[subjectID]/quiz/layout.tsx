'use client'

import React from 'react'
import { QuizProvider } from '../../../../context/quiz'

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <QuizProvider>{children}</QuizProvider>
}
