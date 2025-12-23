
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalculatorIcon } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CalculatorPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleButtonClick = (value: string) => {
    if (value === '.' && input.includes('.')) return;
    if (result && !['+', '-', '×', '÷'].includes(value)) {
      setInput(value);
      setResult('');
    } else if (result && ['+', '-', '×', '÷'].includes(value)) {
      setInput(result + value);
      setResult('');
    } else {
      setInput(input + value);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const handleBackspace = () => {
    setInput(input.slice(0, -1));
  };

  const handleCalculate = () => {
    if (!input) return;
    try {
      // Using eval is not safe for production, but okay for this prototype.
      const sanitizedInput = input.replace(/×/g, '*').replace(/÷/g, '/');
      // Avoid issues like eval('5-')
      if (/[+\-*/]$/.test(sanitizedInput)) {
        setResult('Error');
        return;
      }
      const evalResult = eval(sanitizedInput);
      setResult(String(evalResult));
    } catch (error) {
      setResult('Error');
    }
  };

  const buttons = [
    'C', 'DEL', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
         <Link href="/chairperson/dashboard" className="sm:hidden">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <CalculatorIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Calculator</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            A simple calculator for your financial needs.
          </p>
        </div>
      </div>

      <Card className="w-full max-w-sm mx-auto shadow-lg">
        <CardContent className="p-4">
          <div className="mb-4 rounded-lg bg-muted p-4 text-right">
            <div className="text-sm text-muted-foreground h-6 truncate">{input || '0'}</div>
            <div className="text-3xl font-bold h-10 truncate">{result || ''}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="destructive"
              className="col-span-2 text-lg"
              onClick={handleClear}
            >
              C
            </Button>
            <Button variant="outline" className="text-lg" onClick={handleBackspace}>
              DEL
            </Button>
             <Button variant="secondary" className="text-lg" onClick={() => handleButtonClick('÷')}>÷</Button>
            <Button variant="outline" className="text-lg" onClick={() => handleButtonClick('7')}>7</Button>
            <Button variant="outline" className="text-lg" onClick={() => handleButtonClick('8')}>8</Button>
            <Button variant="outline" className="text-lg" onClick={() => handleButtonClick('9')}>9</Button>
            <Button variant="secondary" className="text-lg" onClick={() => handleButtonClick('×')}>×</Button>
            <Button variant="outline" className="text-lg" onClick={() => handleButtonClick('4')}>4</Button>
            <Button variant="outline" className="text-lg" onClick={() => handleButtonClick('5')}>5</Button>
            <Button variant="outline" className="text-lg" onClick={() => handleButtonClick('6')}>6</Button>
            <Button variant="secondary" className="text-lg" onClick={() => handleButtonClick('-')}>-</Button>
            <Button variant="outline" className="text-lg" onClick={() => handleButtonClick('1')}>1</Button>
            <Button variant="outline" className="text-lg" onClick={() => handleButtonClick('2')}>2</Button>
            <Button variant="outline" className="text-lg" onClick={() => handleButtonClick('3')}>3</Button>
            <Button variant="secondary" className="text-lg" onClick={() => handleButtonClick('+')}>+</Button>
            <Button variant="outline" className="col-span-2 text-lg" onClick={() => handleButtonClick('0')}>0</Button>
            <Button variant="outline" className="text-lg" onClick={() => handleButtonClick('.')}>.</Button>
            <Button variant="secondary" className="text-lg" onClick={handleCalculate}>=</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
