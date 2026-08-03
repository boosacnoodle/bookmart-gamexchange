import { logoutAction } from "@/app/auth-actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="button button-secondary" type="submit">Logout</button>
    </form>
  );
}
