import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

export class AddTool extends StructuredTool {
  name = 'add'
  description =
    'Add multiple numbers together. Use this when you need to calculate the sum of two or more numbers. Example: add([1, 2, 3]) returns 6.'

  schema = z
    .object({
      numbers: z
        .array(z.number())
        .min(1)
        .describe('List of numbers to add together'),
    })
    .describe('Input schema for adding numbers')

  async _call({ numbers }: { numbers: number[] }): Promise<string> {
    const sum = numbers.reduce((a, b) => a + b, 0)
    return `The sum of ${numbers.join(' + ')} = ${sum}`
  }
}

export class SubtractTool extends StructuredTool {
  name = 'subtract'
  description =
    'Subtract numbers. First number minus all subsequent numbers. Example: subtract({ a: 10, b: 3 }) returns 7.'

  schema = z
    .object({
      a: z.number().describe('The number to subtract from (minuend)'),
      b: z.number().describe('The number to subtract (subtrahend)'),
    })
    .describe('Input schema for subtracting numbers')

  async _call({ a, b }: { a: number; b: number }): Promise<string> {
    const result = a - b
    return `${a} - ${b} = ${result}`
  }
}

export class MultiplyTool extends StructuredTool {
  name = 'multiply'
  description =
    'Multiply multiple numbers together. Example: multiply([2, 3, 4]) returns 24.'

  schema = z
    .object({
      numbers: z
        .array(z.number())
        .min(1)
        .describe('List of numbers to multiply together'),
    })
    .describe('Input schema for multiplying numbers')

  async _call({ numbers }: { numbers: number[] }): Promise<string> {
    const product = numbers.reduce((a, b) => a * b, 1)
    return `The product of ${numbers.join(' × ')} = ${product}`
  }
}

export class DivideTool extends StructuredTool {
  name = 'divide'
  description =
    'Divide two numbers. Returns the quotient. Example: divide({ a: 10, b: 2 }) returns 5.'

  schema = z
    .object({
      a: z.number().describe('The dividend (number to be divided)'),
      b: z.number().describe('The divisor (number to divide by)'),
    })
    .describe('Input schema for dividing numbers')

  async _call({ a, b }: { a: number; b: number }): Promise<string> {
    if (b === 0) {
      return 'Error: Division by zero is not allowed.'
    }
    const quotient = a / b
    return `${a} ÷ ${b} = ${quotient}`
  }
}

export const MATH_TOOLS = [
  new AddTool(),
  new SubtractTool(),
  new MultiplyTool(),
  new DivideTool(),
]

export const mathTools = MATH_TOOLS
