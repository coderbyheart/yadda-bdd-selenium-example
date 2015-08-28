Feature: Calculator

  Scenario: Calculate a loan

    Given I am on /
    When I clear the input amount
    And I enter "187.000 €" into the input amount
    And I select "36" from the input duration
    And I click the button@title "[Rating]"
    Then I wait for #effectiveInterest to contain "[Interest]"
    And I wait for #totalInterest to contain "[totalInterest]"
    And I wait for #monthlyRate to contain "[monthlyRate]"

    Where:
       Rating                          | Interest | totalInterest | monthlyRate
       Ausgezeichnete bis gute Bonität | 2,69%    | 7.767 €       | 5.410 €
       Mittlere Bonität                | 3,82%    | 11.007 €      | 5.500 €
       Schwache Bonität                | 4,15%    | 11.965 €      | 5.526 €

  Scenario: Calculate a loan that is too high
    Given I am on /
    When I clear the input amount
    And I enter "250.001 €" into the input amount
    And I click the button@title "Ausgezeichnete bis gute Bonität"
    Then I wait for #calculator to contain "Individuelles Angebot anfordern"
