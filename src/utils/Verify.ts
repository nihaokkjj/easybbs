import type { FormItemRule } from 'element-plus';

const regs = {
  email: /^\w+([\.\w+]*)\w+@([\w-]+\.)+\w+$/,
  number: /^(0|[1-9][0-9]*)$/,
  password: /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*]{8,18}$/,
}

const verify = (rule: FormItemRule, value: any ,reg: RegExp, callback: Function)=>{
  if(value) {
    if (reg.test(value)) {
      callback()
    } else {
      callback(new Error( rule?.message as string || '格式不正确'))
    }
  } else {
    callback()
  }
}

export default {
  email: (rule: FormItemRule , value: any, callback: Function) => {
    return verify(rule, value, regs.email, callback)
  },
  number: (rule: FormItemRule, value: any, callback: Function) => {
    return verify(rule, value, regs.number, callback)
  },
  password: (rule: FormItemRule, value: any, callback: Function) => {
    return verify(rule, value, regs.password, callback)
  }
}