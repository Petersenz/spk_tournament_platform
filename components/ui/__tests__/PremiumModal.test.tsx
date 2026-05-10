import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PremiumModal } from "../PremiumModal";

describe("PremiumModal", () => {
  it("should not render when isOpen is false", () => {
    const { container } = render(
      <PremiumModal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </PremiumModal>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render title and children when isOpen is true", () => {
    render(
      <PremiumModal isOpen={true} onClose={() => {}} title="Test Modal">
        <div data-testid="modal-content">Test Content</div>
      </PremiumModal>,
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <PremiumModal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Content</div>
      </PremiumModal>,
    );

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
