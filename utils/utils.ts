const isDefined= (variable)=>{
    if (typeof(variable) != 'undefined' && variable != null) return true;
    return false
}


const comparator= (a,b)=>{
    console.log(typeof(a),a);
    if(typeof(a) === 'string') return a.localeCompare(b)
    if(typeof(a) === 'number') return a-b
    return 0
}

export{
    isDefined,
    comparator
}