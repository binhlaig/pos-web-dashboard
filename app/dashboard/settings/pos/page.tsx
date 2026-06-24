
import BackToDashboardButton from '@/components/BackToDashboardButton'
import PosSettingsForm from '@/components/settings/pos-settings-form'
import { FeaturePageGuard } from '@/components/feature-page-guard'
import React from 'react'

const page = () => {
  return (
    <FeaturePageGuard featureKey="posRegisterEnabled">
      <div className="min-h-dvh pt-16 sm:pt-[4.5rem]">
        <BackToDashboardButton compact className="fixed left-4 top-4 z-50" />
        <PosSettingsForm/>
      </div>
    </FeaturePageGuard>
  )
}

export default page
