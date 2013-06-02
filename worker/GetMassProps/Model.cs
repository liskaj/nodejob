using System.Runtime.Serialization;

namespace GetMassProps
{
    [DataContract]
    public class Box3d
    {
        [DataMember]
        public double X { get; set; }

        [DataMember]
        public double Y { get; set; }

        [DataMember]
        public double Z { get; set; }
    };

    [DataContract]
    public class Model
    {
        [DataMember(Name="name", Order=1)]
        public string Name { get; set; }

        [DataMember(Name = "mass", Order=2)]
        public double Mass { get; set; }

        [DataMember(Name = "volume", Order=3)]
        public double Volume { get; set; }

        [DataMember(Name="bbox", Order=4)]
        public Box3d BoundingBox { get; set; }
    }
}
