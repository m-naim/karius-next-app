import React, { useState } from 'react';

function Autocomplite({ value, setValue, fetchData }) {
    const [options, setOptions] = useState([]);
    const [show, setShow] = useState(false);

    const select = (value) => {
        setValue(value)
        setOptions([])
    }
    return (
        <div className="flex flex-col items-center">
            <input className='input-primary ' list="auto" id="choice" name="choice" value={value}
                onFocus={() => setShow(true)}
                onBlur={() =>
                    setTimeout(() => {
                        setShow(false);
                    }, 150)
                }
                onChange={
                    async (e) => {
                        const  currentValue = e.currentTarget.value
                        setValue(currentValue);
                        if (currentValue.length < 1) { 
                            setOptions([]) 
                            return 
                        }
                        let data = await fetchData(currentValue);
                        console.log(data);
                        setOptions(data)
                    }
                } />

            {show && options.length > 0 && <ul id="auto" className='bg-dark rounded-lg border border-gray-200 w-full text-gray-900 divide-y divide-solid mt-1'>
                {options.map(op =>
                    <li onClick={() => select(op.symbol)} key={op.symbol} className='px-6 py-2 flex gap-6 content-center cursor-pointer hover:bg-gray-200' >
                        {op.logo && <img className='w-8 h-8 inline-block rounded-full ring-2 ring-white mt-1' src={op.logo} alt='log' />}
                        <div className='flex flex-col'>
                            <span >{op.name}</span>
                            <span className='text-sm'>{op.symbol}</span>
                        </div>
                    </li>)}
            </ul>
            }
        </div>
    );
}

export default Autocomplite;