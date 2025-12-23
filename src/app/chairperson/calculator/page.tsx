
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

export default function CalculatorPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleButtonClick = (value: string) => {
    if (result) {
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
    try {
      // Using eval is not safe for production, but okay for this prototype.
      const evalResult = eval(input.replace(/×/g, '*').replace(/÷/g, '/'));
      setResult(String(evalResult));
    } catch (error) {
      setResult('Error');
    }
  };

  const buttons = [
    '7', '8', '9', '÷',
    '4', '5', '6', '×',
    '1', '2', '3', '-',
    '0', '.', '=', '+',
  ];

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
            <CalculatorIcon className="h-8 w-8 text-primary" />
            <div>
            <h1 className="text-3xl font-bold">Calculator</h1>
            <p className="text-muted-foreground">
                A simple calculator for your financial needs.
            </p>
            </div>
        </div>

      <Card className="max-w-sm mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg bg-muted p-4 text-right">
            <div className="text-sm text-muted-foreground h-6">{input || '0'}</div>
            <div className="text-3xl font-bold h-10">{result || ''}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="destructive"
              className="col-span-2"
              onClick={handleClear}
            >
              C
            </Button>
            <Button variant="outline" onClick={handleBackspace}>
              DEL
            </Button>
            {buttons.map((btn) => (
              <Button
                key={btn}
                variant={['÷', '×', '-', '+', '='].includes(btn) ? 'secondary' : 'outline'}
                onClick={() => {
                  if (btn === '=') {
                    handleCalculate();
                  } else {
                    handleButtonClick(btn);
                  }
                }}
              >
                {btn}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
