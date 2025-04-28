"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calculator, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

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

export default function VatCalculator() {
  const [country, setCountry] = useState<CountryCode>("ID")
  const [amount, setAmount] = useState<number>(VAT.ID.defaultAmt)
  const [flatFee, setFlatFee] = useState<number>(VAT.ID.defaultFlat)
  const [percentFee, setPercentFee] = useState<number>(2)
  const [results, setResults] = useState<any>(null)
  const [isCalculated, setIsCalculated] = useState<boolean>(false)

  // Format number based on locale
  const formatNumber = (val: number, locale: string) => {
    return val.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Set defaults when country changes
  useEffect(() => {
    const cfg = VAT[country]
    setAmount(cfg.defaultAmt)
    setFlatFee(cfg.defaultFlat)

    // Add a setTimeout to ensure state updates have completed before calculating
    setTimeout(() => {
      // Calculate with the default values
      const feeFlat = cfg.defaultFlat
      const feeVar = cfg.defaultAmt * (percentFee / 100)
      const totalFee = feeFlat + feeVar
      const vatBase = totalFee * (cfg.base || 1)
      const vat = vatBase * (cfg.rate || 0)
      const receive = cfg.defaultAmt - totalFee - vat

      setResults({
        feeFlat,
        feeVar,
        totalFee,
        vat,
        receive,
        cfg,
      })

      setIsCalculated(true)
    }, 0)
  }, [country, percentFee])

  // Calculate VAT and fees
  const calculate = () => {
    const cfg = VAT[country]

    const feeFlat = flatFee
    const feeVar = amount * (percentFee / 100)
    const totalFee = feeFlat + feeVar
    const vatBase = totalFee * (cfg.base || 1)
    const vat = vatBase * (cfg.rate || 0)
    const receive = amount - totalFee - vat

    setResults({
      feeFlat,
      feeVar,
      totalFee,
      vat,
      receive,
      cfg,
    })

    setIsCalculated(true)
  }

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
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flatFee" className="text-sm font-medium">
              Flat Fee ({VAT[country].symbol})
            </Label>
            <Input
              id="flatFee"
              type="number"
              step="0.01"
              value={flatFee}
              onChange={(e) => setFlatFee(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentFee" className="text-sm font-medium">
              Percentage Fee (%)
            </Label>
            <Input
              id="percentFee"
              type="number"
              step="0.01"
              value={percentFee}
              onChange={(e) => setPercentFee(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <Button onClick={calculate} className="w-full bg-slate-800 hover:bg-slate-700 transition-all duration-300">
            <Calculator className="mr-2 h-4 w-4" /> Calculate
          </Button>

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
                  {results.cfg.symbol} {formatNumber(results.feeFlat, results.cfg.locale)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Variable fee ({percentFee}%)</span>
                <span className="font-semibold">
                  {results.cfg.symbol} {formatNumber(results.feeVar, results.cfg.locale)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total fee</span>
                <span className="font-semibold">
                  {results.cfg.symbol} {formatNumber(results.totalFee, results.cfg.locale)}
                </span>
              </div>

              {results.cfg.rate > 0 && (
                <>
                  {country === "ID" && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">VAT tax base (11/12 of total fee)</span>
                      <span className="font-semibold">
                        {results.cfg.symbol} {formatNumber(results.totalFee * (11 / 12), results.cfg.locale)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">
                      VAT @{(results.cfg.rate * 100).toFixed(0)}%{country === "ID" ? " (of tax base)" : ""}
                    </span>
                    <span className="font-semibold">
                      {results.cfg.symbol} {formatNumber(results.vat, results.cfg.locale)}
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
                    {results.cfg.symbol} {formatNumber(results.receive, results.cfg.locale)}
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
