"use client"
import React, { useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable'
import ProjectHeader from './ProjectHeader'
import MessageContainer from '../Message/MessageContainer'

const ProjectView = ({projectId}: {projectId: string}) => {

    const [activeFragment, setActiveFragment] = useState<string | null>(null);
  
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
                {/* code and demo */}
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  )
}

export default ProjectView