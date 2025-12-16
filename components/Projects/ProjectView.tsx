"use client"
import React from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable'
import ProjectHeader from './ProjectHeader'

const ProjectView = ({projectId}: {projectId: string}) => {
  return (
    <div className='h-screen'>
        <ResizablePanelGroup direction='horizontal'>
            <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
                <ProjectHeader projectId={projectId}/>
                {/* Messages */}
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