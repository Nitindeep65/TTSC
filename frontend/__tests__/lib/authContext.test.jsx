import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { AuthProvider, useAuth } from "@/lib/authContext"

function TestAuthConsumer() {
  const { user, loginWithEmail, registerWithEmail, logout } = useAuth()

  return (
    <div>
      <div data-testid="user-status">{user ? user.email : "GUEST"}</div>
      <div data-testid="user-name">{user ? user.displayName : "NO_NAME"}</div>

      <button
        type="button"
        data-testid="btn-login"
        onClick={() => loginWithEmail("alex@querycraft.dev", "password123")}
      >
        Sign In
      </button>

      <button
        type="button"
        data-testid="btn-signup"
        onClick={() => registerWithEmail("sofia@cloudscale.io", "password123", "Sofia Davis")}
      >
        Sign Up
      </button>

      <button type="button" data-testid="btn-logout" onClick={() => logout()}>
        Log Out
      </button>
    </div>
  )
}

describe("AuthProvider & Firebase Authentication State", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  test("initializes in guest mode by default", () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId("user-status")).toHaveTextContent("GUEST")
  })

  test("signs in user with email and sets active session", async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    )

    const loginBtn = screen.getByTestId("btn-login")
    await act(async () => {
      fireEvent.click(loginBtn)
    })

    expect(screen.getByTestId("user-status")).toHaveTextContent("alex@querycraft.dev")
  })

  test("registers new user with email and display name", async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    )

    const signupBtn = screen.getByTestId("btn-signup")
    await act(async () => {
      fireEvent.click(signupBtn)
    })

    expect(screen.getByTestId("user-status")).toHaveTextContent("sofia@cloudscale.io")
    expect(screen.getByTestId("user-name")).toHaveTextContent("Sofia Davis")
  })

  test("logs out user and resets session to guest", async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    )

    // 1. Sign In
    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-login"))
    })
    expect(screen.getByTestId("user-status")).toHaveTextContent("alex@querycraft.dev")

    // 2. Log Out
    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-logout"))
    })
    expect(screen.getByTestId("user-status")).toHaveTextContent("GUEST")
  })
})
