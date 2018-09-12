# safe
lebab --replace budget-dashboard.js --transform arrow
lebab --replace budget-dashboard.js --transform for-of
lebab --replace budget-dashboard.js --transform for-each
lebab --replace budget-dashboard.js --transform arg-rest
lebab --replace budget-dashboard.js --transform arg-spread
lebab --replace budget-dashboard.js --transform obj-method
lebab --replace budget-dashboard.js --transform obj-shorthand
lebab --replace budget-dashboard.js --transform multi-var
# unsafe
lebab --replace budget-dashboard.js --transform let
lebab --replace budget-dashboard.js --transform template