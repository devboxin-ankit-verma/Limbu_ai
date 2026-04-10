/// Lightweight logger wrapper.
///
/// Wraps print statements with structured context.
/// Replace with a production logging package (e.g. logger) as needed.
class Logger {
  final String _tag;

  Logger(this._tag);

  void info(String message) {
    // ignore: avoid_print
    print('[$_tag] INFO: $message');
  }

  void error(String message, [Object? error, StackTrace? stackTrace]) {
    // ignore: avoid_print
    print('[$_tag] ERROR: $message${error != null ? ' | $error' : ''}');
    if (stackTrace != null) {
      // ignore: avoid_print
      print(stackTrace);
    }
  }

  void debug(String message) {
    // ignore: avoid_print
    print('[$_tag] DEBUG: $message');
  }
}
