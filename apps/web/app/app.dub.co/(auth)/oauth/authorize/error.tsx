'use client'
 
// import { useEffect } from 'react'
 
export default function Error({
  error,
}: {
  error: Error
}) {
  // useEffect(() => {
  //   console.error(error)
  // }, [error])
 
  return (
    <div>
      <h2>{error.message}</h2>
    </div>
  )
}