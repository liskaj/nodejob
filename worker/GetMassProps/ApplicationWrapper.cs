using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace GetMassProps
{
    class ApplicationWrapper : IDisposable
    {
        private ApplicationWrapper()
        {
        }

        public void Dispose()
        {
            lock (this)
            {
                try
                {
                    if (Server != null)
                    {
                        Server.Quit();
                        Marshal.ReleaseComObject(Server);
                        Server = null;
                        Process process = Process.GetProcessById(ProcessId);

                        process.Kill();
                    }
                }
                catch
                {
                }
                finally
                {
                    ProcessId = 0;
                    Server = null;
                }
            }
        }

        public global::Inventor.Application Server { get; private set; }
        private int ProcessId { get; set; }

        public static ApplicationWrapper Create()
        {
            global::Inventor.Application app = (global::Inventor.Application)Activator.CreateInstance(Type.GetTypeFromProgID("Inventor.Application"));

            while (app.Ready == false)
            {
                System.Threading.Thread.Sleep(100);
            }
            ApplicationWrapper result = new ApplicationWrapper();

            int processId = 0;

            GetWindowThreadProcessId((IntPtr)app.MainFrameHWND, out processId);
            result.ProcessId = processId;
            result.Server = app;
            app.SilentOperation = true;
            app.Visible = false;
            return result;
        }

        [DllImport("user32.dll", EntryPoint = "GetWindowThreadProcessId", SetLastError = true, CharSet = CharSet.Unicode, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        private static extern uint GetWindowThreadProcessId(IntPtr hwnd, out int processId);
    }
}
