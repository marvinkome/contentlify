const serverUrl = Cypress.env('serverUrl');

describe('Login page tests [E2E]', () => {
    beforeEach(() => {
        // create new user for login
        cy.request('POST', `${serverUrl}/api/auth/register`, {
            email: 'johndoe@gmail.com',
            password: 'this is the password for test user',
            fullName: 'Test User'
        });
    });

    it('login a user and set auth token', () => {
        // visit page
        cy.visit('/login');

        // server setup
        cy.server();
        cy.route('POST', `${serverUrl}/api/auth/login`).as('loginE2EApi');

        // type in email
        cy.get('input#email').type('johndoe@gmail.com');

        // type in password
        cy.get('input#password').type('this is the password for test user');

        // click button
        cy.get('[data-testid="submit-btn"]').click();

        // check that request has been made to the server
        cy.wait('@loginE2EApi').should(() => {
            // check that token has been added to lacal storage
            expect(localStorage.getItem('contento_auth_token')).exist;

            // expect redirect to occur
            cy.url().should('include', '/');
        });
    });

    afterEach(() => {
        // remove test user from DB
        cy.request('DELETE', `${serverUrl}/api/auth/user`, {
            email: 'johndoe@gmail.com'
        });
    });
});
