import { render, screen } from "@testing-library/react";
import { PermissionGate } from "../PermissionGate";

describe("PermissionGate", () => {
  const userPerms = ["resources:read", "resources:create", "reservations:read"];

  it("renders children when user has required permission", () => {
    render(
      <PermissionGate
        permissions={["resources:read"]}
        userPermissions={userPerms}
      >
        <button>Visible</button>
      </PermissionGate>
    );
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("hides children when user lacks permission (hide mode)", () => {
    render(
      <PermissionGate
        permissions={["admin:delete"]}
        userPermissions={userPerms}
        mode="hide"
      >
        <button>Hidden</button>
      </PermissionGate>
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("disables children when user lacks permission (disable mode)", () => {
    render(
      <PermissionGate
        permissions={["admin:delete"]}
        userPermissions={userPerms}
        mode="disable"
      >
        <button>Disabled</button>
      </PermissionGate>
    );
    const wrapper = screen.getByText("Disabled").closest("div");
    expect(wrapper).toHaveAttribute("aria-disabled", "true");
    expect(wrapper?.className).toContain("pointer-events-none");
  });

  it("renders fallback when permission denied in hide mode", () => {
    render(
      <PermissionGate
        permissions={["admin:delete"]}
        userPermissions={userPerms}
        fallback={<p>No access</p>}
      >
        <button>Secret</button>
      </PermissionGate>
    );
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
    expect(screen.getByText("No access")).toBeInTheDocument();
  });

  it("requires all permissions when requireAll is true", () => {
    render(
      <PermissionGate
        permissions={["resources:read", "admin:delete"]}
        userPermissions={userPerms}
        requireAll
      >
        <button>All Required</button>
      </PermissionGate>
    );
    expect(screen.queryByText("All Required")).not.toBeInTheDocument();
  });

  it("allows any permission when requireAll is false (default)", () => {
    render(
      <PermissionGate
        permissions={["resources:read", "admin:delete"]}
        userPermissions={userPerms}
      >
        <button>Any Match</button>
      </PermissionGate>
    );
    expect(screen.getByText("Any Match")).toBeInTheDocument();
  });

  it("renders children when no permissions are required", () => {
    render(
      <PermissionGate permissions={[]} userPermissions={userPerms}>
        <button>Always Visible</button>
      </PermissionGate>
    );
    expect(screen.getByText("Always Visible")).toBeInTheDocument();
  });
});
