import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';
import { Plus, RefreshCw, DollarSign, ArrowRightLeft, Settings, TrendingUp, Globe } from 'lucide-react';

interface Currency {
    id: string;
    code: string;
    name: string;
    nameNe?: string;
    symbol: string;
    decimals: number;
    isActive: boolean;
    isBase: boolean;
}

interface ExchangeRate {
    id?: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    effectiveDate: string;
    source: string;
}

export default function CurrencyPage() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'currencies' | 'rates'>('currencies');

    // Modal states
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);

    // Form states
    const [currencyForm, setCurrencyForm] = useState<Partial<Currency>>({
        code: '',
        name: '',
        nameNe: '',
        symbol: '',
        decimals: 2,
        isActive: true,
        isBase: false,
    });
    const [rateForm, setRateForm] = useState<ExchangeRate>({
        fromCurrency: 'NPR',
        toCurrency: 'USD',
        rate: 0,
        effectiveDate: new Date().toISOString().split('T')[0],
        source: 'manual',
    });
    const [convertForm, setConvertForm] = useState({
        amount: 0,
        fromCurrency: 'USD',
        toCurrency: 'NPR',
    });
    const [conversionResult, setConversionResult] = useState<{
        originalAmount: number;
        convertedAmount: number;
        rate: number;
    } | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

    useEffect(() => {
        fetchCurrencies();
    }, []);

    useEffect(() => {
        if (activeTab === 'rates' && currencies.length > 0) {
            fetchExchangeRates();
        }
    }, [activeTab, currencies]);

    const fetchCurrencies = async () => {
        try {
            setLoading(true);
            const response = await api.get('/currencies?all=true');
            setCurrencies(response.data);
        } catch (error) {
            console.error('Failed to fetch currencies:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExchangeRates = async () => {
        try {
            const base = currencies.find((c) => c.isBase)?.code || 'NPR';
            const response = await api.get(`/currencies/${base}/rates`);
            setExchangeRates(response.data);
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
        }
    };

    const initializeCurrencies = async () => {
        try {
            setIsSubmitting(true);
            await api.post('/currencies/initialize', {});
            await fetchCurrencies();
        } catch (error) {
            console.error('Failed to initialize currencies:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveCurrency = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingCurrency) {
                await api.put(`/currencies/${editingCurrency.code}`, currencyForm);
            } else {
                await api.post('/currencies', currencyForm);
            }
            setShowCurrencyModal(false);
            setCurrencyForm({ code: '', name: '', nameNe: '', symbol: '', decimals: 2, isActive: true, isBase: false });
            setEditingCurrency(null);
            fetchCurrencies();
        } catch (error) {
            console.error('Failed to save currency:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveRate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.post('/currencies/rates', rateForm);
            setShowRateModal(false);
            setRateForm({ fromCurrency: 'NPR', toCurrency: 'USD', rate: 0, effectiveDate: new Date().toISOString().split('T')[0], source: 'manual' });
            fetchExchangeRates();
        } catch (error) {
            console.error('Failed to save rate:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConvert = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await api.post('/currencies/convert', convertForm);
            setConversionResult(response.data);
        } catch (error) {
            console.error('Failed to convert:', error);
            setConversionResult(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditCurrency = (currency: Currency) => {
        setEditingCurrency(currency);
        setCurrencyForm(currency);
        setShowCurrencyModal(true);
    };

    const swapRateDirection = () => {
        setRateForm((prev) => {
            const nextRate = prev.rate > 0 ? Number((1 / prev.rate).toFixed(6)) : prev.rate;
            return {
                ...prev,
                fromCurrency: prev.toCurrency,
                toCurrency: prev.fromCurrency,
                rate: nextRate,
            };
        });
    };

    const baseCurrency = currencies.find((c) => c.isBase);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Globe className="h-7 w-7 text-indigo-600" />
                        Multi-Currency Management
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Manage currencies and exchange rates for international transactions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowConvertModal(true)}>
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Convert
                    </Button>
                    {currencies.length === 0 && (
                        <Button onClick={initializeCurrencies} isLoading={isSubmitting}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Initialize Defaults
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <DollarSign className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Currencies</p>
                                <p className="text-xl font-semibold">{currencies.length}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Settings className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Base Currency</p>
                                <p className="text-xl font-semibold">{baseCurrency?.code || 'NPR'}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active Currencies</p>
                                <p className="text-xl font-semibold">{currencies.filter((c) => c.isActive).length}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Exchange Rates</p>
                                <p className="text-xl font-semibold">{exchangeRates.length}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-4 border-b">
                <button
                    className={`pb-2 px-1 font-medium ${activeTab === 'currencies' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('currencies')}
                >
                    Currencies
                </button>
                <button
                    className={`pb-2 px-1 font-medium ${activeTab === 'rates' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('rates')}
                >
                    Exchange Rates
                </button>
            </div>

            {/* Currencies Tab */}
            {activeTab === 'currencies' && (
                <Card>
                    <CardHeader
                        title="Currencies"
                        action={
                            <Button size="sm" onClick={() => setShowCurrencyModal(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Currency
                            </Button>
                        }
                    />
                    <CardBody>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading...</div>
                        ) : currencies.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No currencies configured</p>
                                <Button className="mt-4" onClick={initializeCurrencies} isLoading={isSubmitting}>
                                    Initialize Default Currencies
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left border-b">
                                            <th className="pb-3 font-medium text-gray-600">Code</th>
                                            <th className="pb-3 font-medium text-gray-600">Name</th>
                                            <th className="pb-3 font-medium text-gray-600">Symbol</th>
                                            <th className="pb-3 font-medium text-gray-600">Decimals</th>
                                            <th className="pb-3 font-medium text-gray-600">Status</th>
                                            <th className="pb-3 font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currencies.map((currency) => (
                                            <tr key={currency.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 font-medium">
                                                    {currency.code}
                                                    {currency.isBase && (
                                                        <Badge className="ml-2" variant="info">Base</Badge>
                                                    )}
                                                </td>
                                                <td className="py-3">
                                                    {currency.name}
                                                    {currency.nameNe && (
                                                        <span className="text-gray-500 text-sm ml-2">({currency.nameNe})</span>
                                                    )}
                                                </td>
                                                <td className="py-3">{currency.symbol}</td>
                                                <td className="py-3">{currency.decimals}</td>
                                                <td className="py-3">
                                                    <Badge variant={currency.isActive ? 'success' : 'neutral'}>
                                                        {currency.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3">
                                                    <Button size="sm" variant="ghost" onClick={() => openEditCurrency(currency)}>
                                                        Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Exchange Rates Tab */}
            {activeTab === 'rates' && (
                <Card>
                    <CardHeader
                        title={`Exchange Rates (Base: ${baseCurrency?.code || 'NPR'})`}
                        action={
                            <Button size="sm" onClick={() => setShowRateModal(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Rate
                            </Button>
                        }
                    />
                    <CardBody>
                        {exchangeRates.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No exchange rates configured</p>
                                <p className="text-sm mt-2">Add exchange rates from the base currency to other currencies</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left border-b">
                                            <th className="pb-3 font-medium text-gray-600">From</th>
                                            <th className="pb-3 font-medium text-gray-600">To</th>
                                            <th className="pb-3 font-medium text-gray-600">Rate</th>
                                            <th className="pb-3 font-medium text-gray-600">Effective Date</th>
                                            <th className="pb-3 font-medium text-gray-600">Source</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exchangeRates.map((rate, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="py-3 font-medium">{rate.fromCurrency}</td>
                                                <td className="py-3">{rate.toCurrency}</td>
                                                <td className="py-3">{Number(rate.rate).toFixed(6)}</td>
                                                <td className="py-3">{new Date(rate.effectiveDate).toLocaleDateString()}</td>
                                                <td className="py-3">
                                                    <Badge variant="neutral">{rate.source}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Add/Edit Currency Modal */}
            <Modal
                isOpen={showCurrencyModal}
                onClose={() => { setShowCurrencyModal(false); setEditingCurrency(null); }}
                title={editingCurrency ? 'Edit Currency' : 'Add Currency'}
            >
                <form onSubmit={handleSaveCurrency}>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                label="Currency Code"
                                placeholder="USD, EUR, INR..."
                                value={currencyForm.code}
                                onChange={(e) => setCurrencyForm({ ...currencyForm, code: e.target.value.toUpperCase() })}
                                disabled={!!editingCurrency}
                                required
                                maxLength={3}
                            />
                            <Input
                                label="Name"
                                placeholder="US Dollar"
                                value={currencyForm.name}
                                onChange={(e) => setCurrencyForm({ ...currencyForm, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Nepali Name"
                                placeholder="अमेरिकी डलर"
                                value={currencyForm.nameNe}
                                onChange={(e) => setCurrencyForm({ ...currencyForm, nameNe: e.target.value })}
                            />
                            <Input
                                label="Symbol"
                                placeholder="$"
                                value={currencyForm.symbol}
                                onChange={(e) => setCurrencyForm({ ...currencyForm, symbol: e.target.value })}
                                required
                            />
                            <Input
                                label="Decimal Places"
                                type="number"
                                min={0}
                                max={4}
                                value={currencyForm.decimals}
                                onChange={(e) => setCurrencyForm({ ...currencyForm, decimals: parseInt(e.target.value) })}
                            />
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={currencyForm.isActive}
                                        onChange={(e) => setCurrencyForm({ ...currencyForm, isActive: e.target.checked })}
                                    />
                                    Active
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={currencyForm.isBase}
                                        onChange={(e) => setCurrencyForm({ ...currencyForm, isBase: e.target.checked })}
                                    />
                                    Base Currency
                                </label>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={() => setShowCurrencyModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            {editingCurrency ? 'Update' : 'Create'}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>

            {/* Add Exchange Rate Modal */}
            <Modal isOpen={showRateModal} onClose={() => setShowRateModal(false)} title="Add Exchange Rate">
                <form onSubmit={handleSaveRate}>
                    <ModalBody>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">From Currency</label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={rateForm.fromCurrency}
                                        onChange={(e) => setRateForm({ ...rateForm, fromCurrency: e.target.value })}
                                    >
                                        {currencies.map((c) => (
                                            <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">To Currency</label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={rateForm.toCurrency}
                                        onChange={(e) => setRateForm({ ...rateForm, toCurrency: e.target.value })}
                                    >
                                        {currencies.map((c) => (
                                            <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <Input
                                label="Exchange Rate"
                                type="number"
                                step="0.000001"
                                placeholder="1.000000"
                                value={rateForm.rate}
                                onChange={(e) => setRateForm({ ...rateForm, rate: parseFloat(e.target.value) })}
                                required
                            />
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                    Rate format: 1 {rateForm.fromCurrency} = {Number(rateForm.rate || 0).toFixed(6)} {rateForm.toCurrency}
                                </span>
                                <Button type="button" size="sm" variant="outline" onClick={swapRateDirection}>
                                    Swap & Invert
                                </Button>
                            </div>
                            <Input
                                label="Effective Date"
                                type="date"
                                value={rateForm.effectiveDate}
                                onChange={(e) => setRateForm({ ...rateForm, effectiveDate: e.target.value })}
                                required
                            />
                            <Input
                                label="Source"
                                placeholder="manual, nrb, bank..."
                                value={rateForm.source}
                                onChange={(e) => setRateForm({ ...rateForm, source: e.target.value })}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={() => setShowRateModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            Save Rate
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>

            {/* Currency Converter Modal */}
            <Modal
                isOpen={showConvertModal}
                onClose={() => { setShowConvertModal(false); setConversionResult(null); }}
                title="Currency Converter"
            >
                <form onSubmit={handleConvert}>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                label="Amount"
                                type="number"
                                step="0.01"
                                placeholder="100.00"
                                value={convertForm.amount}
                                onChange={(e) => setConvertForm({ ...convertForm, amount: parseFloat(e.target.value) })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">From</label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={convertForm.fromCurrency}
                                        onChange={(e) => setConvertForm({ ...convertForm, fromCurrency: e.target.value })}
                                    >
                                        {currencies.map((c) => (
                                            <option key={c.code} value={c.code}>{c.code}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">To</label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={convertForm.toCurrency}
                                        onChange={(e) => setConvertForm({ ...convertForm, toCurrency: e.target.value })}
                                    >
                                        {currencies.map((c) => (
                                            <option key={c.code} value={c.code}>{c.code}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {conversionResult && (
                                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">
                                            {conversionResult.originalAmount.toLocaleString()} {convertForm.fromCurrency}
                                        </p>
                                        <p className="text-2xl font-bold text-indigo-600 mt-2">
                                            {conversionResult.convertedAmount.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}{' '}
                                            {convertForm.toCurrency}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Rate: 1 {convertForm.fromCurrency} = {conversionResult.rate.toFixed(6)}{' '}
                                            {convertForm.toCurrency}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={() => setShowConvertModal(false)}>
                            Close
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            Convert
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    );
}
