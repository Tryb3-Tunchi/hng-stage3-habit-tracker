import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

import SignupForm from "@/components/auth/SignupForm";
import LoginForm from "@/components/auth/LoginForm";
import { getSession, getUsers } from "@/lib/storage";

describe("auth flow", () => {
  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
  });

  it("submits the signup form and creates a session", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(
      screen.getByTestId("auth-signup-email"),
      "test@example.com",
    );
    await user.type(screen.getByTestId("auth-signup-password"), "password123");
    await user.click(screen.getByTestId("auth-signup-submit"));

    await waitFor(() => {
      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe("test@example.com");

      const session = getSession();
      expect(session).not.toBeNull();
      expect(session?.email).toBe("test@example.com");

      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows an error for duplicate signup email", async () => {
    const user = userEvent.setup();

    // First signup
    render(<SignupForm />);
    await user.type(
      screen.getByTestId("auth-signup-email"),
      "dupe@example.com",
    );
    await user.type(screen.getByTestId("auth-signup-password"), "password123");
    await user.click(screen.getByTestId("auth-signup-submit"));
    await waitFor(() => expect(getUsers()).toHaveLength(1));

    // Second signup with same email
    localStorage.setItem("habit-tracker-session", "null");
    render(<SignupForm />);
    const emailInputs = screen.getAllByTestId("auth-signup-email");
    const passwordInputs = screen.getAllByTestId("auth-signup-password");
    const submitBtns = screen.getAllByTestId("auth-signup-submit");

    await user.type(emailInputs[emailInputs.length - 1], "dupe@example.com");
    await user.type(passwordInputs[passwordInputs.length - 1], "password456");
    await user.click(submitBtns[submitBtns.length - 1]);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "User already exists",
      );
    });
  });

  it("submits the login form and stores the active session", async () => {
    const user = userEvent.setup();

    // Pre-create a user
    render(<SignupForm />);
    await user.type(
      screen.getByTestId("auth-signup-email"),
      "login@example.com",
    );
    await user.type(screen.getByTestId("auth-signup-password"), "mypassword");
    await user.click(screen.getByTestId("auth-signup-submit"));
    await waitFor(() => expect(getUsers()).toHaveLength(1));

    // Clear session then login
    localStorage.setItem("habit-tracker-session", "null");
    mockReplace.mockClear();

    render(<LoginForm />);
    const emailInputs = screen.getAllByTestId("auth-login-email");
    const passwordInputs = screen.getAllByTestId("auth-login-password");
    const submitBtns = screen.getAllByTestId("auth-login-submit");

    await user.type(emailInputs[emailInputs.length - 1], "login@example.com");
    await user.type(passwordInputs[passwordInputs.length - 1], "mypassword");
    await user.click(submitBtns[submitBtns.length - 1]);

    await waitFor(() => {
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session?.email).toBe("login@example.com");
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows an error for invalid login credentials", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(
      screen.getByTestId("auth-login-email"),
      "wrong@example.com",
    );
    await user.type(screen.getByTestId("auth-login-password"), "wrongpassword");
    await user.click(screen.getByTestId("auth-login-submit"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid email or password",
      );
    });
  });
});
