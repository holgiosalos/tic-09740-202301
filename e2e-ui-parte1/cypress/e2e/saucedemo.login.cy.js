describe("Verifying Login Process for SauceDemo", () => {
    beforeEach(() => {
      cy.visit("https://www.saucedemo.com/");
    });

    it("Login should notify when a wrong username/password combination is used.", () => {
      cy.get("#user-name").type("testUser");
      cy.get("#password").type("testPass");
      cy.get("#login-button").click();

      // Assertion for error message
      cy.get("[data-test='error']").should(
        "include.text",
        "Username and password do not match any user in this service")
    });

    it("Login should work for existing user.", () => {
      cy.get("#user-name").type("standard_user");
      cy.get("#password").type("secret_sauce");
      cy.get("#login-button").click();
 
      // Assertion that verifies that products list is displayed
      cy.get(".title").should("have.text", "Products")
    });
});
