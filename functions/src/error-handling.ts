import { Response } from "firebase-functions";
import { randomUUID } from "crypto";

/**
 * Error wrapper for share link errors. To be used when manually throwing share link errors.
 */
export class ShareLinkError extends Error {
  /** Corresponding http response code of the error. */
  readonly httpCode: number;

  /**
   * Construct a new ShareLinkError.
   *
   * @param shareLinkErrorCode Share link error code for the error.
   */
  constructor(readonly shareLinkErrorCode: ShareLinkErrorCode) {
    const { message, httpCode } = getShareLinkErrorByCode(shareLinkErrorCode);
    super(message);
    this.httpCode = httpCode;
  }
}

/**
 * Possible error codes for share link errors.
 * Used to look up the corresponding error message and code with getShareLinkErrorByCode().
 */
export enum ShareLinkErrorCode {
  INVALID_URL,
  URL_NOT_FOUND,
  UNEXPECTED_ERROR,
}

/**
 * List of error types for share link errors.
 */
const SHARE_LINK_ERRORS = {
  [ShareLinkErrorCode.INVALID_URL]: {
    httpCode: 400,
    message: "The provided URL was missing or invalid.",
  },
  [ShareLinkErrorCode.URL_NOT_FOUND]: {
    httpCode: 404,
    message: "No share links were found for the provided URL.",
  },
  [ShareLinkErrorCode.UNEXPECTED_ERROR]: {
    httpCode: 500,
    message: `An unexpected error occurred.`,
  },
};

/**
 * Returns the matching share link error object for the given error code.
 *
 * Throws an error if no matching error is found.
 *
 * @param code ShareLinkErrorCode to retrieve error for.
 * @returns Share link error object for the given code.
 */
export function getShareLinkErrorByCode(code: ShareLinkErrorCode) {
  const error = SHARE_LINK_ERRORS[code];
  if (!error) {
    throw new Error("Invalid share link error code.");
  } else {
    return error;
  }
}

/**
 * Sends an unexpected error response to the client and throws the internal error.
 *
 * @param internalError Error object to be logged.
 * @param res response object to send error to.
 */
export function sendAndThrowUnexpectedError(
  internalError: Error,
  res: Response
) {
  const errorId = randomUUID();
  const errorIdText =
    "If this error persists, please contact us and reference error ID: ";
  const shareLinkError = getShareLinkErrorByCode(
    ShareLinkErrorCode.UNEXPECTED_ERROR
  );
  res
    .status(shareLinkError.httpCode)
    .send(`${shareLinkError.message} ${errorIdText}${errorId}`);
  throw new Error(`${internalError.message} Error ID: ${errorId}`);
}

/**
 * Sends an invalid URL error response to the client and throws an internal error.
 *
 * @param res response object to send error to.
 * @param url URL that was invalid.
 */
export function sendAndThrowInvalidUrlError(res: Response, url?: string) {
  const shareLinkError = getShareLinkErrorByCode(
    ShareLinkErrorCode.INVALID_URL
  );
  const urlText = url ? `URL: ${url}` : "";
  res
    .status(shareLinkError.httpCode)
    .send(`${shareLinkError.message} ${urlText}`);
  throw new Error(`${shareLinkError.message} ${urlText}`);
}