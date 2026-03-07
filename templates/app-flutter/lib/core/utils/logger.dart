/// Logger utility.
///
/// Centralized logging. Use this instead of print() or debugPrint() directly.
/// In release builds, DEBUG level messages are suppressed automatically.
import 'package:flutter/foundation.dart';

enum LogLevel { debug, info, warn, error }

class Logger {
  final String _tag;

  const Logger([this._tag = 'App']);

  void debug(String message) => _log(LogLevel.debug, message);

  void info(String message) => _log(LogLevel.info, message);

  void warn(String message) => _log(LogLevel.warn, message);

  void error(String message, [Object? error, StackTrace? stackTrace]) {
    _log(LogLevel.error, message);
    if (error != null) _log(LogLevel.error, 'Error: $error');
    if (stackTrace != null) _log(LogLevel.error, stackTrace.toString());
  }

  void _log(LogLevel level, String message) {
    if (!kDebugMode && level == LogLevel.debug) return;
    debugPrint('[${level.name.toUpperCase()}][$_tag] $message');
  }
}

/// Global logger instance. Use directly or create named instances per class:
///   final _log = Logger('AuthRepository');
final logger = Logger();
