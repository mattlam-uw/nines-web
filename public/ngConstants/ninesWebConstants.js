/*---------------------------------------------------------------------------
 Nines Web Main Module Constants
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')

// Number of digits to be calculated and displayed for availability rating
.constant("numDigits", 5)

// Minimum status code value at or over which responses are considered errors
.constant("errorThreshold", 400)

// Valid ping frequency values (in recurring minutes)
.constant("pingFrequencies", [5, 10, 15, 30, 60, 120, 360, 720, 1440])

// Base URL for full response HTML from full requests executed as follow-ups
// to header request errors
.constant("ErrorResponseHtmlUrl", "http://localhost:3000/errors/response/");
