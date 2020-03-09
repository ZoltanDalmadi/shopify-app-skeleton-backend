class VerificationError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'VerificationError';
    this.status = status;
  }
}

module.exports = VerificationError;
