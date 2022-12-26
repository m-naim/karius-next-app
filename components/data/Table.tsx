import { format } from 'date-fns';
import useModal from '../../lib/UseModal';
import AddTransaction from '../portfolio/AddTransaction';
import React, { useEffect, useState } from 'react';
import { comparator } from '../../utils/utils';
import data from '../../mock/data';
import { round10 } from '../../utils/decimalAjustement';
import Modal from '../layout/Modal';

const toPrecentille = (val) => round10(val * 100, -2) + '%';

function Table({ propRows = data.rows, columns = data.columns, addtransaction, type = 'allocation', editable=false }) {
    const { isShowing, toggle } = useModal();
    const [ticker, setTicker] = useState("");

    const [columnSorting, setColumnSorting] = useState("");
    const [sortSens, setSortSens] = useState(1);

    const [rows, setRows] = useState(propRows);

    const addclick = (value) => {
        setTicker(value);
        toggle();
    }

    const sortby = (column) => {
        setSortSens(sortSens * -1)
        setColumnSorting(column)
        console.log(column);
        setRows(rows.sort((a, b) => comparator(a[column], b[column]) * sortSens))
    }

    useEffect(() => {
        setRows(propRows)
    }, [propRows])

    return (
        <div >
            <div className='flex place-content-between py-4'>
                <p className='text-lg'>{rows.length} éléments</p>
                <div className='flex gap-8'>
                    {editable && <button className='btn-primary' onClick={toggle} >+ Ajouter</button>}
                </div>
                <Modal isShowing={isShowing} hide={() => toggle()}>
                    <AddTransaction hide={toggle} addClick={addtransaction} symbol={ticker} />
                </Modal>
            </div>
            <table className="w-full divide-y border-gray-200 ">
                <thead>
                    <tr className="">
                        {editable && <th></th>}
                        {columns.map(c =>
                            <th onClick={() => sortby(c)}
                                className="text-left text-lg text-gray-500 dark:text-gray-300 py-2 font-light" >
                                <div className='flex gap-1'>
                                    {c}
                                    {c == columnSorting && <img className={`${sortSens > 0 && 'rotate-180'} transition delay-75 duration-300 h-6`} src="https://img.icons8.com/material/24/228BE6/up--v1.png" />}
                                </div>
                            </th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(r => type === 'allocation' ? AllocationLine(r, addclick, editable) : TransactionLine(r, addclick, editable))}
                </tbody>
            </table>
        </div>
    );
}

const AllocationLine = (r, addclick, editable) => {
    return (<tr className="border-separate border-spacing-4 border-b border-gray-200 dark:border-slate-600 text-md font-medium ">
        {editable &&
            <td className='py-2'>
                <button type="button"
                    onClick={() => addclick(r.symbol)}
                    className="bg-dark bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Add transaction</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16"> <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" /> </svg>
                </button>
            </td>
        }
        <td className='py-2'>
            <div className='flex flex-col w-fit '>
                <p className=''>{r.asset.name}</p>
                <p className='text-xs align-middle text-blue-500 rounded p-1 w-fit '>{r.symbol}</p>
            </div>
        </td>
        <td className='py-2'>
            <p className='text-primary'>{toPrecentille(r.weight)}</p>
        </td>
        <td className='py-2'>
            <p>{r.qty}</p>
        </td>
        <td className='py-2'>
            <p>{round10(r.asset.last, -2)}€</p>
        </td>
        <td className='py-2'>
            <p>{round10(r.bep, -2)}€</p>
        </td>
    </tr>);
}

const TransactionLine = (r, addclick, editable) => {
    return (
        <tr className="border-collapse border-b border-gray-200 dark:border-slate-600">
            {editable &&
                <td >
                    <button type="button"
                        onClick={() => addclick(r.symbol)}
                        className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                        <span className="sr-only">Add transaction</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16"> <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" /> </svg>
                    </button>
                </td>
            }
            <td >
                <div className='flex flex-col'>
                    <p>{r.symbol}</p>
                    <p className='text-xs align-middle text-blue-500 rounded p-1 w-fit '>{r.symbol}</p>
                </div>
            </td>
            <td className=''>
                <p className='font-semibold'>{format(new Date(r.date), 'MM/dd/yyyy')}</p>
            </td>
            <td className=''>
                <p>{r.qty}</p>
            </td>
            <td className=''>
                <p>{r.price}</p>
            </td>

        </tr>

    );
}

export default Table;