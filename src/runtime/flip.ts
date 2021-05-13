export const flip = fn => (...props) => props.reverse() && fn(...props)
