export const fizzbuzz = (num: number):string => {
    if(num < 1 || num > 100 ) return 'Invalid input';
    if(num % 3 === 0 && num % 5 === 0) return 'FizzBuzz';
    if(num % 3 === 0) return 'Fizz';
    if(num % 5 === 0) return 'Buzz';
    return num.toString();
}