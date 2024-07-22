export const fizzbuzz = (num: number):string => {
    if(num < 1 || num > 100 ) return 'Invalid input';
    return num.toString();
}