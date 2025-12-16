import ProjectView from '@/components/Projects/ProjectView';
import React from 'react'

const page = async({params}:{params:Promise<{projectId:string}>}) => {
    const { projectId } = await params;

  return (
    <ProjectView projectId={projectId}/>
  )
}

export default page