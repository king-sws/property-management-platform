/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, DollarSign, XCircle, CheckCircle2, Clock, AlertTriangle, CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Types
interface Subscription {
  id: string;
  status: string;
  stripeStatus?: string;
  tier: string;
  isTrialing: boolean;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  propertyCount: number;
  propertyLimit: number;
  propertyUsage: number;
  cancelAtPeriodEnd?: boolean;
}

interface SubscriptionData {
  hasSubscription: boolean;
  subscription?: Subscription;
  canStartTrial?: boolean;
  needsSetup?: boolean;
}

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

interface ActionConfig {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'success' | 'danger' | 'warning' | 'info';
  action: string;
}

export default function SubscriptionSimulator() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/simulate');
      const data = await response.json();
      
      console.log('API Response:', data); // Debug log
      
      if (data.success) {
        setSubscriptionData(data.data);
      } else {
        console.error('API returned error:', data.error);
        setResult({ success: false, error: data.error || 'Failed to load subscription' });
      }
    } catch (error) {
      console.error('Load error:', error);
      setResult({ success: false, error: 'Failed to connect to server' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string, payload = {}) => {
    setActionInProgress(action);
    setResult(null);

    try {
      const response = await fetch('/api/subscription/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setTimeout(() => loadSubscription(), 2000);
      }
    } catch (error) {
      console.error('Action error:', error);
      setResult({ success: false, error: 'Failed to execute action' });
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Check if subscription data exists and has required properties
  const hasSubscription = subscriptionData?.hasSubscription && subscriptionData?.subscription;

  if (!hasSubscription) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Subscription Found</AlertTitle>
          <AlertDescription>
            {subscriptionData?.needsSetup 
              ? 'Your subscription setup is incomplete. Please try syncing your subscription or contact support.'
              : subscriptionData?.canStartTrial
              ? 'Start a trial first to use the simulator.'
              : 'Unable to load subscription data. Please refresh the page or contact support.'}
          </AlertDescription>
        </Alert>
        
        {subscriptionData?.needsSetup && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(subscriptionData, null, 2)}
              </pre>
              <Button 
                onClick={loadSubscription} 
                className="mt-4"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const sub = subscriptionData.subscription!;
  const isTrialing = sub.isTrialing;
  const trialEndsAt = sub.trialEnd ? new Date(sub.trialEnd) : null;
  const daysRemaining = trialEndsAt 
    ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8" />
            <div>
              <CardTitle className="text-3xl">Subscription Simulator</CardTitle>
              <CardDescription className="text-purple-100">
                Test trial endings, payments, and webhooks without editing the database
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Current Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusCard
              label="Status"
              value={isTrialing ? 'TRIAL' : sub.status.toUpperCase()}
              icon={isTrialing ? Clock : CheckCircle2}
              variant={isTrialing ? 'warning' : 'success'}
            />
            <StatusCard
              label="Tier"
              value={sub.tier}
              icon={Zap}
              variant="info"
            />
            <StatusCard
              label="Days Remaining"
              value={isTrialing ? `${daysRemaining}d` : 'N/A'}
              icon={Calendar}
              variant={daysRemaining <= 3 ? 'danger' : 'warning'}
            />
            <StatusCard
              label="Properties"
              value={`${sub.propertyCount} / ${sub.propertyLimit}`}
              icon={CreditCard}
              variant="default"
            />
          </div>

          {trialEndsAt && (
            <Alert className="mt-4">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Trial ends: {trialEndsAt.toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Trial Actions */}
        {isTrialing && (
          <ActionCard
            title="Trial Actions"
            description="Test what happens when trial ends"
            actions={[
              {
                label: 'End Trial Now (No Payment)',
                description: 'Simulate trial ending without payment method',
                icon: XCircle,
                variant: 'danger',
                action: 'end-trial-no-payment',
              },
              {
                label: 'End Trial + Auto Payment',
                description: 'Simulate successful trial conversion',
                icon: CheckCircle2,
                variant: 'success',
                action: 'end-trial-with-payment',
              },
              {
                label: 'End Trial + Failed Payment',
                description: 'Simulate payment failure at trial end',
                icon: AlertTriangle,
                variant: 'warning',
                action: 'end-trial-payment-failed',
              },
            ]}
            onAction={handleAction}
            actionInProgress={actionInProgress}
          />
        )}

        {/* Payment Actions */}
        <ActionCard
          title="Payment Simulations"
          description="Test different payment scenarios"
          actions={[
            {
              label: 'Simulate Successful Payment',
              description: 'Trigger invoice.paid webhook',
              icon: DollarSign,
              variant: 'success',
              action: 'simulate-payment-success',
            },
            {
              label: 'Simulate Failed Payment',
              description: 'Trigger invoice.payment_failed webhook',
              icon: XCircle,
              variant: 'danger',
              action: 'simulate-payment-failed',
            },
            {
              label: 'Simulate Past Due',
              description: 'Set subscription to past_due status',
              icon: AlertTriangle,
              variant: 'warning',
              action: 'simulate-past-due',
            },
          ]}
          onAction={handleAction}
          actionInProgress={actionInProgress}
        />

        {/* Webhook Testing */}
        <ActionCard
          title="Webhook Testing"
          description="Manually trigger Stripe webhooks"
          actions={[
            {
              label: 'Trigger subscription.updated',
              description: 'Test subscription update webhook',
              icon: RefreshCw,
              variant: 'info',
              action: 'webhook-subscription-updated',
            },
            {
              label: 'Trigger trial_will_end',
              description: 'Test 3-day warning webhook',
              icon: Clock,
              variant: 'warning',
              action: 'webhook-trial-will-end',
            },
            {
              label: 'Sync from Stripe',
              description: 'Force sync current Stripe status',
              icon: Zap,
              variant: 'info',
              action: 'force-sync',
            },
          ]}
          onAction={handleAction}
          actionInProgress={actionInProgress}
        />

        {/* Status Changes */}
        <ActionCard
          title="Status Changes"
          description="Test different subscription states"
          actions={[
            {
              label: 'Set to Active',
              description: 'Convert to paid subscription',
              icon: CheckCircle2,
              variant: 'success',
              action: 'set-active',
            },
            {
              label: 'Set to Canceled',
              description: 'Cancel subscription immediately',
              icon: XCircle,
              variant: 'danger',
              action: 'set-canceled',
            },
            {
              label: 'Reset to Trial',
              description: 'Reset back to trial state (testing only)',
              icon: RefreshCw,
              variant: 'warning',
              action: 'reset-to-trial',
            },
          ]}
          onAction={handleAction}
          actionInProgress={actionInProgress}
        />
      </div>

      {/* Result Display */}
      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {result.success ? 'Action Successful' : 'Action Failed'}
          </AlertTitle>
          <AlertDescription>
            <p>{result.message || result.error}</p>
            {result.data && (
              <pre className="mt-3 p-3 bg-white rounded text-xs overflow-auto max-h-48 border">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-4 rounded border">
            {JSON.stringify(subscriptionData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ 
  label, 
  value, 
  icon: Icon, 
  variant 
}: { 
  label: string; 
  value: string; 
  icon: React.ComponentType<{ className?: string }>; 
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
}) {
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    default: 'bg-gray-50 border-gray-200 text-gray-800',
  };

  return (
    <Card className={colors[variant]}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium opacity-75">{label}</span>
        </div>
        <div className="text-lg font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ActionCard({ 
  title, 
  description, 
  actions, 
  onAction, 
  actionInProgress 
}: {
  title: string;
  description: string;
  actions: ActionConfig[];
  onAction: (action: string) => void;
  actionInProgress: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <ActionButton
            key={action.action}
            {...action}
            onClick={() => onAction(action.action)}
            disabled={actionInProgress !== null}
            isLoading={actionInProgress === action.action}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function ActionButton({ 
  label, 
  description, 
  icon: Icon, 
  variant, 
  onClick, 
  disabled, 
  isLoading 
}: ActionConfig & {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}) {
  const colors = {
    success: 'bg-green-600 hover:bg-green-700 text-white border-green-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700',
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      variant="outline"
      className={`w-full h-auto p-4 justify-start ${
        !disabled && !isLoading ? colors[variant] : ''
      }`}
    >
      <div className="flex items-start gap-3 text-left">
        {isLoading ? (
          <RefreshCw className="h-5 w-5 animate-spin mt-0.5 flex-shrink-0" />
        ) : (
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <div className="font-semibold mb-1">{label}</div>
          <div className="text-sm opacity-90 font-normal">{description}</div>
        </div>
      </div>
    </Button>
  );
}