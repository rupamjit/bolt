"use client"
import React, { useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable'
import ProjectHeader from './ProjectHeader'
import MessageContainer from '../Message/MessageContainer'
import { Fragment } from '@prisma/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Code, CrownIcon, EyeIcon, Link } from 'lucide-react'
import { Button } from '../ui/button'
import FragmentWeb from './FragmentWeb'
import { FileExplorer } from './FileExplorer'

const ProjectView = ({projectId}: {projectId: string}) => {

    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const [tabState, setTabState] = useState<'preview' | 'code'>('preview');
  
  return (
    <div className='h-screen'>
        <ResizablePanelGroup direction='horizontal'>
            <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
                <ProjectHeader projectId={projectId}/>
                {/* Messages */}
                <MessageContainer projectId={projectId} activeFragment={activeFragment} setActiveFragment={setActiveFragment}/>
            </ResizablePanel>
            <ResizableHandle withHandle/>
            <ResizablePanel defaultSize={65} minSize={50} className="flex flex-col min-h-0">
                 <Tabs
            className="h-full flex flex-col"
            defaultValue="preview"
            value={tabState}
            onValueChange={(value) => setTabState(value as 'preview' | 'code')}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 border rounded-md">
                <TabsTrigger
                  value="preview"
                  className="rounded-md px-3 flex items-center gap-x-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className="rounded-md px-3 flex items-center gap-x-2"
                >
                  <Code className="h-4 w-4" />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                
                  <Button asChild size={"sm"} variant={"default"}>
                    <Link href={"/pricing"}>
                      <CrownIcon className="h-4 w-4 mr-2" />
                      Upgrade
                    </Link>
                  </Button>
                )
              </div>
            </div>

            <TabsContent
              value="preview"
              className="flex-1 h-[calc(100%-4rem)] overflow-hidden"
            >
              {activeFragment ? (
                <FragmentWeb data={activeFragment} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a fragment to preview
                </div>
              )}
            </TabsContent>
            <TabsContent
              value="code"
              className="flex-1 h-[calc(100%-4rem)] overflow-hidden"
            >
              {activeFragment?.files ? (
                <FileExplorer files={activeFragment.files as Record<string, string>} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a fragment to view code
                </div>
              )}
            </TabsContent>
          </Tabs>
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  )
}

export default ProjectView