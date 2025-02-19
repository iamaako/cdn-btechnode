import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cnWithCondition(condition: boolean, classValue: ClassValue) {
  return condition ? classValue : '';
}

export function cnWithArray(classValues: ClassValue[]) {
  return classValues.join(' ');
}
