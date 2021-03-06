/// <reference types="cypress" />

context("Registration Card", () => {
  Cypress.Commands.add("requestsCount", (alias) =>
    cy
      .wrap()
      .then(
        () => cy.state("requests").filter((req) => req.alias === alias).length
      )
  );

  beforeEach(() => {
    cy.server();
    cy.route({
      method: "GET",
      url: "/status",
      response: {
        status: "up",
        tensorflowGpu: false,
        tensorflowVersion: "1.15.3",
      },
    });

    cy.route({
      method: "POST",
      url: "/identify",
      response: {
        name: "test",
        confidence: 23.652345,
        bboxes: [{ x: 0, y: 0, w: 0, h: 0 }],
      },
    }).as("identify");

    cy.route({
      method: "POST",
      url: "/add_person/*",
      response: {
        bboxes: [{ x: 0, y: 0, w: 0, h: 0 }],
      },
    }).as("recording");

    cy.route({
      method: "GET",
      url: "/train_model",
      response: { "training status": "complete" },
      delay: 1000,
    }).as("trainModel");

    cy.visit(Cypress.config("baseUrl"));
  });

  it("throws validation error if name not entered", () => {
    cy.get('[type="submit"] > .MuiButton-label').click();
    cy.get(".MuiFormHelperText-root").should("contain", "Name is required");

    // should be hitting identify endpoint
    cy.wait("@identify");
    cy.requestsCount("identify").should("be.greaterThan", 0);
    cy.requestsCount("recording").should("be", 0);
  });

  it("starts recording if name provided", () => {
    cy.get("[data-testid=newUserName]").type("test user");
    cy.get('[type="submit"] > .MuiButton-label').click();

    // should be hitting recording endpoint
    cy.wait("@recording");
    cy.requestsCount("recording").should("be.greaterThan", 0);
  });

  it("test training model", () => {
    // hit training button
    cy.get("[data-testid=trainingButton] > .MuiButton-label").click();

    // check for spinner
    cy.get(".MuiCircularProgress-svg").should("exist");

    // check for snackbar after training completes
    cy.wait(["@trainModel"]);
    cy.get("[data-testid=trainingComplete] > .MuiPaper-root").should("exist");

    // test clickaway
    cy.get("[data-testid=user_name]").click();
    cy.get("[data-testid=trainingComplete] > .MuiPaper-root").should("exist");

    // test clicking x
    cy.get(".MuiIconButton-label > .MuiSvgIcon-root").click();
    cy.get("[data-testid=trainingComplete] > .MuiPaper-root").should(
      "not.exist"
    );

    // test timeout
    // bring snackbar back up
    cy.get("[data-testid=trainingButton] > .MuiButton-label").click();

    // wait to receive success response
    cy.wait(["@trainModel"]);

    // wait for snackbar to timeout
    cy.wait(6000).then(() => {
      cy.get("[data-testid=trainingComplete] > .MuiPaper-root").should(
        "not.exist"
      );
    });
  });
});
