"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calculator, ArrowRight, Info } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// VAT data for different countries
const VAT = {
  ID: {
    name: "Indonesia",
    rate: 0.12,
    base: 11 / 12,
    symbol: "Rp",
    locale: "id-ID",
    flag: "🇮🇩",
    defaultAmt: 160000,
    defaultFlat: 1600,
  },
  MY: {
    name: "Malaysia",
    rate: 0.0,
    base: 1,
    symbol: "RM",
    locale: "ms-MY",
    flag: "🇲🇾",
    defaultAmt: 47,
    defaultFlat: 0.5,
  },
  TH: {
    name: "Thailand",
    rate: 0.07,
    base: 1,
    symbol: "฿",
    locale: "th-TH",
    flag: "🇹🇭",
    defaultAmt: 370,
    defaultFlat: 4,
  },
  VN: {
    name: "Vietnam",
    rate: 0.08,
    base: 1,
    symbol: "₫",
    locale: "vi-VN",
    flag: "🇻🇳",
    defaultAmt: 246000,
    defaultFlat: 2500,
  },
  PH: {
    name: "Philippines",
    rate: 0.12,
    base: 1,
    symbol: "₱",
    locale: "en-PH",
    flag: "🇵🇭",
    defaultAmt: 560,
    defaultFlat: 6,
  },
  SG: {
    name: "Singapore",
    rate: 0.0,
    base: 1,
    symbol: "$",
    locale: "en-SG",
    flag: "🇸🇬",
    defaultAmt: 13.5,
    defaultFlat: 0.15,
  },
}

type CountryCode = keyof typeof VAT

// Country-specific tooltip examples (roughly equivalent to $0.20 USD)
const tooltipExamples = {
  ID: {
    flatFee: "3,000",
    symbol: "IDR",
  },
  PH: {
    flatFee: "10",
    symbol: "PHP",
  },
  TH: {
    flatFee: "7",
    symbol: "THB",
  },
  MY: {
    flatFee: "1",
    symbol: "MYR",
  },
  VN: {
    flatFee: "5,000",
    symbol: "VND",
  },
  SG: {
    flatFee: "0.30",
    symbol: "SGD",
  },
}

export default function VatCalculator() {
  const [country, setCountry] = useState<CountryCode>("ID")
  const [amount, setAmount] = useState<string | number>(VAT.ID.defaultAmt)
  const [flatFee, setFlatFee] = useState<string | number>(VAT.ID.defaultFlat)
  const [percentFee, setPercentFee] = useState<string | number>(2)
  const [results, setResults] = useState<any>(null)
  const [isCalculated, setIsCalculated] = useState<boolean>(false)

  // Helper to format with thousands separator (en-US: ',' for thousands, '.' for decimal)
  const formatInput = (val: string | number) => {
    if (val === '' || val === null || val === undefined) return ''
    const num = Number((typeof val === 'string' ? val.replace(/,/g, '').replace(',', '.') : val) || 0)
    if (isNaN(num)) return ''
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 })
  }

  // Calculate VAT and fees automatically on input change
  useEffect(() => {
    const cfg = VAT[country]
    const amt = Number((typeof amount === 'string' ? amount.toString().replace(/,/g, '').replace(',', '.') : amount) || 0)
    const flat = Number((typeof flatFee === 'string' ? flatFee.toString().replace(/,/g, '').replace(',', '.') : flatFee) || 0)
    let percent = Number((typeof percentFee === 'string' ? percentFee.toString().replace(/,/g, '').replace(',', '.') : percentFee) || 0)
    // Clamp percent between 0 and 100
    percent = Math.max(0, Math.min(100, percent))
    const feeFlat = flat
    const feeVar = amt * (percent / 100)
    const totalFee = feeFlat + feeVar
    const vatBase = totalFee * (cfg.base || 1)
    const vat = vatBase * (cfg.rate || 0)
    const receive = amt - totalFee - vat
    setResults({
      feeFlat,
      feeVar,
      totalFee,
      vat,
      receive,
      cfg,
    })
    setIsCalculated(true)
  }, [country, amount, flatFee, percentFee])

  // Format number for results (en-US)
  const formatNumber = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  useEffect(() => {
    setAmount(VAT[country].defaultAmt)
    setFlatFee(VAT[country].defaultFlat)
  }, [country])

  const flatFeeTooltip = `A fixed, predetermined charge applied per transaction, regardless of the transaction amount.\nExample: Payouts – ${tooltipExamples[country].symbol} ${tooltipExamples[country].flatFee} per transaction.`

  const percentFeeTooltip = `A variable charge calculated as a percentage of the transaction amount. The final fee scales with the transaction value.\nExample: 2% of the payment amount.`

  return (
    <Card className="w-full shadow-sm border border-slate-200 bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <span className="text-slate-800">VAT Calculator</span>
        </CardTitle>
        <ThemeToggle />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium">
              Country of Service
            </Label>
            <Select value={country} onValueChange={(value: CountryCode) => setCountry(value)}>
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VAT).map(([code, data]) => (
                  <SelectItem key={code} value={code}>
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{data.flag}</span>
                      <span>{data.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Transaction Amount ({VAT[country].symbol})
            </Label>
            <Input
              id="amount"
              type="text"
              value={formatInput(amount)}
              onChange={e => {
                let val = e.target.value.replace(/,/g, '').replace(',', '.')
                if (val === '') {
                  setAmount('')
                  return
                }
                // Only allow valid numbers
                if (!isNaN(Number(val))) {
                  setAmount(val)
                }
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flatFee" className="text-sm font-medium flex items-center gap-2">
              Flat Fee ({VAT[country].symbol})
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] whitespace-pre-line">
                    {flatFeeTooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="flatFee"
              type="text"
              value={formatInput(flatFee)}
              onChange={e => {
                let val = e.target.value.replace(/,/g, '').replace(',', '.')
                if (val === '') {
                  setFlatFee('')
                  return
                }
                if (!isNaN(Number(val))) {
                  setFlatFee(val)
                }
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentFee" className="text-sm font-medium flex items-center gap-2">
              Percentage Fee (%)
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] whitespace-pre-line">
                    {percentFeeTooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="percentFee"
              type="text"
              value={formatInput(percentFee)}
              onChange={e => {
                let val = e.target.value.replace(/,/g, '').replace(',', '.')
                if (val === '') {
                  setPercentFee('')
                  return
                }
                if (!isNaN(Number(val))) {
                  // Clamp between 0 and 100
                  let num = Math.max(0, Math.min(100, Number(val)))
                  setPercentFee(num)
                }
              }}
              className="w-full"
            />
          </div>

          {isCalculated && results && (
            <div
              className={cn(
                "mt-6 rounded-md p-4 space-y-3 transition-all duration-500 ease-in-out",
                "bg-slate-50 dark:from-slate-800 dark:to-slate-900",
                "border border-slate-200 dark:border-slate-700",
              )}
            >
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Flat fee</span>
                <span className="font-semibold">
                  {results.cfg.symbol} {formatNumber(results.feeFlat)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Variable fee ({percentFee}%)</span>
                <span className="font-semibold">
                  {results.cfg.symbol} {formatNumber(results.feeVar)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total fee</span>
                <span className="font-semibold">
                  {results.cfg.symbol} {formatNumber(results.totalFee)}
                </span>
              </div>

              {results.cfg.rate > 0 && (
                <>
                  {country === "ID" && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">VAT tax base (11/12 of total fee)</span>
                      <span className="font-semibold">
                        {results.cfg.symbol} {formatNumber(results.totalFee * (11 / 12))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">
                      VAT @{(results.cfg.rate * 100).toFixed(0)}%{country === "ID" ? " (of tax base)" : ""}
                    </span>
                    <span className="font-semibold">
                      {results.cfg.symbol} {formatNumber(results.vat)}
                    </span>
                  </div>
                </>
              )}

              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>

              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-white">You receive</span>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-green-500" />
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">
                    {results.cfg.symbol} {formatNumber(results.receive)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">VAT Calculator • April 2025</div>
        </div>
      </CardContent>
    </Card>
  )
}
