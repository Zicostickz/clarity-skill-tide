;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u100))
(define-constant err-unauthorized (err u101))
(define-constant err-invalid-rating (err u102))
(define-constant err-already-exists (err u103))
(define-constant err-invalid-coordinates (err u104))

;; Status constants
(define-constant status-active "active")
(define-constant status-completed "completed")
(define-constant status-scheduled "scheduled")

;; Data structures
(define-map profiles
  principal
  {
    skill: (string-ascii 50),
    location: (string-ascii 50),
    latitude: uint,
    longitude: uint,
    rating: uint,
    review-count: uint
  }
)

(define-map offerings
  uint 
  {
    owner: principal,
    title: (string-ascii 50),
    description: (string-ascii 200),
    duration: uint,
    status: (string-ascii 20)
  }
)

(define-map meetups
  uint
  {
    offering-id: uint,
    provider: principal,
    recipient: principal,
    timestamp: uint,
    status: (string-ascii 20)
  }
)

;; Data variables
(define-data-var next-offering-id uint u1)
(define-data-var next-meetup-id uint u1)

;; Private functions
(define-private (validate-coordinates (lat uint) (long uint))
  (and (< lat u90000000) (< long u180000000))
)

;; Public functions
(define-public (create-profile (skill (string-ascii 50)) (location (string-ascii 50)) (lat uint) (long uint))
  (let ((profile {skill: skill, 
               location: location,
               latitude: lat,
               longitude: long,
               rating: u0,
               review-count: u0}))
    (asserts! (validate-coordinates lat long) (err err-invalid-coordinates))
    (asserts! (is-none (map-get? profiles tx-sender)) (err err-already-exists))
    (ok (map-insert profiles tx-sender profile))
  )
)

(define-public (update-profile (skill (string-ascii 50)) (location (string-ascii 50)) (lat uint) (long uint))
  (let ((existing-profile (unwrap! (map-get? profiles tx-sender) err-not-found)))
    (asserts! (validate-coordinates lat long) (err err-invalid-coordinates))
    (ok (map-set profiles 
      tx-sender
      (merge existing-profile 
        {
          skill: skill,
          location: location,
          latitude: lat,
          longitude: long
        }
      )
    ))
  )
)

;; [Rest of the original contract functions remain unchanged]
