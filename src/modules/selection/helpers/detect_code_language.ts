/**
 * Attempt to detect the programming language of code
 */
export function detect_code_language(code: string): string {
  if (/{[\s\S]*}/.test(code) && /var |const |let |function |=>/.test(code)) {
    return "javascript";
  }
  if (
    /{[\s\S]*}/.test(code) &&
    /class |interface |type |<.*>|import.*from/.test(code)
  ) {
    return "typescript";
  }
  if (/(?:<\/?[a-z][\s\S]*?>)/.test(code)) {
    return "html";
  }
  if (/\b(def|class|import|if __name__ == ['"]__main__['"])/.test(code)) {
    return "python";
  }
  if (
    /\b(public class|private|protected|void|String|int|boolean)\b/.test(code)
  ) {
    return "java";
  }
  return "plaintext";
}
