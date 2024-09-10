window.$ = (query, el=document)=>{
    "The poor man's jQuery"
    return el.querySelector(query);
};
window.$all = (query, el=document)=>{
    return [...el.querySelectorAll(query)];
};