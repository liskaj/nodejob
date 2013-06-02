using System;
using System.IO;
using System.Runtime.Serialization.Json;

namespace GetMassProps
{
    class Program
    {
        static int Main(string[] args)
        {
            Model model = null;

            using (ApplicationWrapper app = ApplicationWrapper.Create())
            {
                string fileName = string.Format(@"{0}\{1}", app.Server.DesignProjectManager.ActiveDesignProject.WorkspacePath, args[0]);

                if (File.Exists(fileName) == false)
                {
                    Console.Error.WriteLine("Unable to locate file");
                    return 1;
                }
                global::Inventor.PartDocument document = app.Server.Documents.Open(fileName) as global::Inventor.PartDocument;

                if (document == null)
                {
                    Console.Error.WriteLine("Unable to obtain part document from given file");
                    return 2;
                }
                global::Inventor.PartComponentDefinition definition = document.ComponentDefinition;

                model = new Model
                {
                    Name = document.DisplayName,
                    Mass = definition.MassProperties.Mass,
                    Volume = definition.MassProperties.Volume,
                    BoundingBox = new Box3d
                    {
                        X = definition.RangeBox.MaxPoint.X - definition.RangeBox.MinPoint.X,
                        Y = definition.RangeBox.MaxPoint.Y - definition.RangeBox.MinPoint.Y,
                        Z = definition.RangeBox.MaxPoint.Z - definition.RangeBox.MinPoint.Z,
                    },
                };
                document.Close(true);
            }
            using (System.IO.FileStream stream = File.OpenWrite(args[1]))
            {
                DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(Model));

                serializer.WriteObject(stream, model);
            }
            return 0;
        }
    }
}
