import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DropZone, type UploadedFile } from '@/components/upload/DropZone'
import { ClassifySuggestion, type ClassifyResult } from '@/components/upload/ClassifySuggestion'
import { useArchiveStore } from '@/store/archiveStore'
import { saveImage } from '@/lib/imageStorage'
import { APP_COLORS } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

type Step = 'upload' | 'classify' | 'done'

export function UploadPage() {
  const navigate = useNavigate()
  const { apps, features, flows, addApp, addFeature, addFlow, addScreens, getFeaturesByApp, getFlowsByFeature } = useArchiveStore()
  const [step, setStep] = useState<Step>('upload')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [savedCount, setSavedCount] = useState(0)

  const handleFiles = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    setStep('classify')
  }

  const handleConfirm = async (result: ClassifyResult) => {
    let total = 0

    for (const group of result.groups) {
      let app = apps.find(a => a.name.toLowerCase() === group.appName.toLowerCase())
      if (!app) app = addApp({ name: group.appName, color: group.appColor })

      const existingFeatures = getFeaturesByApp(app.id)
      let feature = existingFeatures.find(f => f.name.toLowerCase() === group.featureName.toLowerCase())
      if (!feature) feature = addFeature({ appId: app.id, name: group.featureName })

      const existingFlows = getFlowsByFeature(feature.id)
      let flow = existingFlows.find(f => f.name.toLowerCase() === group.flowName.toLowerCase())
      if (!flow) flow = addFlow({ appId: app.id, featureId: feature.id, name: group.flowName, tags: [] })

      const newScreens = addScreens(group.files.map((f, i) => ({
        appId: app!.id,
        featureId: feature!.id,
        flowId: flow!.id,
        filename: f.filename,
        imageData: f.imageData,
        order: i,
        tags: [],
      })))

      // 이미지는 IndexedDB에 저장 (압축 포함)
      await Promise.all(
        newScreens.map((sc, i) => saveImage(sc.id, group.files[i].imageData))
      )

      total += group.files.length
    }

    setSavedCount(total)
    setStep('done')
  }

  return (
    <AppLayout title="업로드">
      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {(['upload', 'classify', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-6 h-px bg-border" />}
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                step === s
                  ? 'bg-accent text-white'
                  : i < ['upload', 'classify', 'done'].indexOf(step)
                    ? 'bg-bg-elevated text-text-secondary'
                    : 'text-text-muted'
              }`}>
                <span>{i + 1}</span>
                <span className="hidden sm:inline">
                  {s === 'upload' ? '업로드' : s === 'classify' ? '분류 확인' : '완료'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {step === 'upload' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">이미지 업로드</h2>
              <p className="text-sm text-text-muted">
                앱 화면 캡처를 업로드하면 파일명을 분석해 자동으로 분류해 드립니다.
              </p>
            </div>
            <DropZone onFiles={handleFiles} />
            <div className="rounded-xl border border-border bg-bg-card/50 p-4">
              <p className="text-xs font-semibold text-text-secondary mb-3">파일명 규칙 가이드</p>
              <div className="space-y-2 text-xs text-text-muted font-mono">
                <p><span className="text-accent">앱명_기능명_순서.png</span></p>
                <p className="text-text-muted/70">예: orix_search_01.png → Orix 앱 / Search 기능</p>
                <p className="text-text-muted/70">예: togate_main_01.png → Togate 앱 / Main 기능</p>
                <p className="text-text-muted/70">규칙이 없어도 업로드 후 직접 수정할 수 있습니다.</p>
              </div>
            </div>
          </div>
        )}

        {step === 'classify' && (
          <ClassifySuggestion
            files={uploadedFiles}
            onConfirm={handleConfirm}
            onReset={() => { setUploadedFiles([]); setStep('upload') }}
          />
        )}

        {step === 'done' && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-green-400" />
            </div>
            <h2 className="text-sm font-semibold text-text-primary mb-1">
              {savedCount}개 화면이 저장되었습니다
            </h2>
            <p className="text-xs text-text-muted mb-4">
              아카이브에서 확인하고 플로우를 정리해보세요.
            </p>
            <div className="flex gap-2 justify-center">
              <button className="btn btn-outline" onClick={() => setStep('upload')}>계속 업로드</button>
              <button className="btn btn-primary" onClick={() => navigate('/')}>아카이브 보기</button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
