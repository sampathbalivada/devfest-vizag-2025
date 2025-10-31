'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SiteSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { updateSiteSettings } from '@/app/settings/actions';

interface SettingsManagementProps {
    initialSettings: SiteSettings;
    token: string;
    onRefresh: () => void;
}

export function SettingsManagement({ initialSettings, token, onRefresh }: SettingsManagementProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

    const handleToggle = async (key: keyof SiteSettings, value: boolean) => {
        setIsUpdating(true);
        const newSettings = { ...settings, [key]: value };
        
        const result = await updateSiteSettings(newSettings, token);
        if (result.success) {
            setSettings(newSettings);
            toast({ title: 'Success', description: 'Site settings updated.' });
            onRefresh();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsUpdating(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>Manage global settings for the website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                    <Label htmlFor="live-agenda-toggle" className="flex flex-col space-y-1">
                        <span>Show Live Agenda</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Display the "Happening Now & Next" section on the homepage.
                        </span>
                    </Label>
                    <div className="flex items-center gap-2">
                        {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Switch
                            id="live-agenda-toggle"
                            checked={settings.showLiveAgenda}
                            onCheckedChange={(value) => handleToggle('showLiveAgenda', value)}
                            disabled={isUpdating}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
