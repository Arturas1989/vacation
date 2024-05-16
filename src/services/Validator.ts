type RulesCheck = {
  greater_than: (val: number, args: number[]) => boolean
  less_than: (val: number, args: number[]) => boolean
  between: (val: number, args: number[]) => boolean
  equal_to: (val: number, args: number[]) => boolean
}

type Rule = ['greater_than' | 'less_than' | 'equal_to' | 'between', number[]]

type TypesCheck = {
  number: (val: unknown) => boolean
  numeric: (val: unknown) => boolean
  array: (val: unknown) => boolean
  object: (val: unknown) => boolean
  string: (val: unknown) => boolean
  boolean: (val: unknown) => boolean
}

type Type = keyof TypesCheck

export type FormOption = 'SalaryForm'

export type ValidationOptions = {
  [key: string]: {
    types: Type[]
    rules: Rule[]
  }
}

type AllValidationOptions = {
  [key in FormOption]: ValidationOptions
}

export type Fields = { [key: string]: unknown }

export class Validator {
  private allValidationOptions: AllValidationOptions
  private validationOptions: ValidationOptions
  private fields: Fields
  private typesCheck: TypesCheck
  private ruleCheck: RulesCheck
  public errors: { [key: string]: string[] }
  constructor(form: FormOption, fields: Fields) {
    this.allValidationOptions = {
      SalaryForm: {
        year: {
          types: ['numeric'],
          rules: [['greater_than', [0]]]
        },
        salary: {
          types: ['numeric'],
          rules: [['greater_than', [0]]]
        },
        days: {
          types: ['numeric'],
          rules: [['greater_than', [0]]]
        }
      }
    }
    this.validationOptions = this.allValidationOptions[form]
    this.fields = fields
    this.errors = {}
    this.typesCheck = {
      number: (val: unknown) => typeof val === 'number',
      numeric: (val: unknown) => typeof val === 'string' && !isNaN(parseInt(val)),
      string: (val: unknown) => typeof val === 'string',
      boolean: (val: unknown) => typeof val === 'boolean',
      array: (val: unknown) => Array.isArray(val),
      object: (val: unknown) => !Array.isArray(val) && typeof val === 'object'
    }
    this.ruleCheck = {
      greater_than: (val: number, args: number[]) => val > args[0],
      less_than: (val: number, args: number[]) => val < args[0],
      between: (val: number, args: number[]) => val >= args[0] && val <= args[1],
      equal_to: (val: number, args: number[]) => val === args[0]
    }
  }

  validate() {
    for (const field in this.fields) {
      const { types, rules } = this.validationOptions[field]
      this.validateTypes(types, this.fields[field], field)
      this.validateRules(rules, this.fields[field], field)
    }
  }

  pushError(error: string, field: string) {
    if (field in this.errors) {
      this.errors[field].push(error)
    } else {
      this.errors[field] = [error]
    }
  }

  validateTypes(types: Type[], val: unknown, field: string) {
    for (const type of types) {
      const isValidType = this.typesCheck[type](val)
      console.log(isValidType, type, val)
      if (!isValidType) {
        const error = 'value is not ' + type
        this.pushError(error, field)
      }
    }
  }

  validateRules(rules: Rule[], val: unknown, field: string) {
    for (const rule of rules) {
      const [ruleOption, args] = rule
      if (this.typesCheck['numeric'](val)) {
        val = +(val as string);
        if(typeof val === 'number'){
          const isValidRule = this.ruleCheck[ruleOption](val, args)
          if (!isValidRule) {
            const error = `value has to be ${ruleOption.replace(/_/g, ' ')} ${args.join(' and ')}`
            this.pushError(error, field)
          }
        }
      }
    }
  }
}