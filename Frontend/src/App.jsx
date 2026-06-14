import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from "./app.routes.jsx"
import { AuthContextProvider } from "./features/auth/auth.context.jsx"

function App() {
  return (
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  )
}

export default App

