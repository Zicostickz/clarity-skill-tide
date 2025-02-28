;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u100))
(define-constant err-unauthorized (err u101))
(define-constant err-invalid-rating (err u102))
(define-constant err-already-exists (err u103))

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

;; Public functions
(define-public (create-profile (skill (string-ascii 50)) (location (string-ascii 50)) (lat uint) (long uint))
  (let ((profile {skill: skill, 
                 location: location,
                 latitude: lat,
                 longitude: long,
                 rating: u0,
                 review-count: u0}))
    (ok (map-insert profiles tx-sender profile))
  )
)

(define-public (post-offering (title (string-ascii 50)) (description (string-ascii 200)) (duration uint))
  (let ((offering-id (var-get next-offering-id)))
    (map-insert offerings 
      offering-id
      {
        owner: tx-sender,
        title: title,
        description: description,
        duration: duration,
        status: "active"
      }
    )
    (var-set next-offering-id (+ offering-id u1))
    (ok offering-id)
  )
)

(define-public (schedule-meetup (offering-id uint) (recipient principal) (timestamp uint))
  (let ((meetup-id (var-get next-meetup-id))
        (offering (unwrap! (map-get? offerings offering-id) err-not-found)))
    (asserts! (is-eq (get owner offering) tx-sender) err-unauthorized)
    (map-insert meetups
      meetup-id
      {
        offering-id: offering-id,
        provider: tx-sender,
        recipient: recipient,
        timestamp: timestamp,
        status: "scheduled"
      }
    )
    (var-set next-meetup-id (+ meetup-id u1))
    (ok meetup-id)
  )
)

(define-public (complete-meetup (meetup-id uint))
  (let ((meetup (unwrap! (map-get? meetups meetup-id) err-not-found)))
    (asserts! (is-eq (get provider meetup) tx-sender) err-unauthorized)
    (map-set meetups
      meetup-id
      (merge meetup {status: "completed"})
    )
    (ok true)
  )
)

(define-read-only (get-profile (user principal))
  (ok (map-get? profiles user))
)

(define-read-only (get-offering (offering-id uint))
  (ok (map-get? offerings offering-id))
)

(define-read-only (get-meetup (meetup-id uint))
  (ok (map-get? meetups meetup-id))
)
