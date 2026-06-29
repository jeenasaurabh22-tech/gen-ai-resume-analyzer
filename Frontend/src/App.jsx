import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from "./app.routes.jsx"
import { AuthContextProvider } from "./features/auth/auth.context.jsx"

function App() {
  return (
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
    //this is the main entry point of the application, where we wrap our app with the AuthContextProvider to provide authentication context to all components, and use RouterProvider to handle routing based on the defined routes in app.routes.jsx.
  )
}

export default App

