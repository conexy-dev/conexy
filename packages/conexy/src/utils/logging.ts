import chalk from "chalk"

type LogLevel = 'success' | 'info' | 'warn' | 'error'

export class Logging {
  private message: string
  private level: LogLevel

  constructor(level: LogLevel, message: string) {
    this.message = message
    this.level = level
    this.send()
  }

  private send() {
    return console.log(chalk.white('🠞'), chalk.blueBright(`[${this.level}]`), this.message);
  }
}