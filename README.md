# SkillTide
A decentralized platform for skill-swapping with location-based meetups built on Stacks blockchain.

## Features
- Create skill profiles with location data
- Post skill offerings and requests 
- Match users based on complementary skills
- Schedule and confirm meetups
- Rate and review skill exchanges

## Setup and Installation
1. Clone the repository
2. Install Clarinet (if not already installed)
3. Run `clarinet check` to verify the contract
4. Run `clarinet test` to run the test suite

## Usage Examples
```clarity
;; Create a skill profile
(contract-call? .skill-tide create-profile "Web Development" "Brooklyn, NY" u40.7128 u74.0060)

;; Post a skill offering
(contract-call? .skill-tide post-offering "JavaScript Tutoring" "Teaching modern JS concepts" u3)

;; Schedule a meetup
(contract-call? .skill-tide schedule-meetup offering-id recipient-id u1677628800)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
